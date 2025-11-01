from flask import Flask, render_template, request, jsonify
import folium
import requests
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import os

app = Flask(__name__)

class MapService:
    def __init__(self):
        self.geolocator = Nominatim(user_agent="WebMapApp/1.0")
    
    def geocode(self, address):
        """Chuyển địa chỉ thành tọa độ"""
        try:
            location = self.geolocator.geocode(address)
            if location:
                return {
                    'lat': location.latitude,
                    'lon': location.longitude,
                    'address': location.address,
                    'success': True
                }
        except Exception as e:
            print(f"Geocoding error: {e}")
    
    def find_nearby_places(self, lat, lon, place_type, radius=1000):
        overpass_url = "http://overpass-api.de/api/interpreter"
        
        # Create query based on place_type
        if place_type == 'general':
            # Tìm các địa điểm thú vị và có ý nghĩa du lịch
            query = f"""
            [out:json][timeout:15];
            (
              node["tourism"~"attraction|museum|monument|viewpoint|hotel|hostel|guest_house|artwork"](around:{radius},{lat},{lon});
              way["tourism"~"attraction|museum|monument|viewpoint|hotel|hostel|guest_house|artwork"](around:{radius},{lat},{lon});
              node["historic"~"monument|memorial|castle|ruins|archaeological_site"](around:{radius},{lat},{lon});
              way["historic"~"monument|memorial|castle|ruins|archaeological_site"](around:{radius},{lat},{lon});
              node["amenity"~"restaurant|cafe|bar|pub|theatre|cinema|library|university"](around:{radius},{lat},{lon});
              way["amenity"~"restaurant|cafe|bar|pub|theatre|cinema|library|university"](around:{radius},{lat},{lon});
              node["leisure"~"park|garden|sports_centre|stadium"](around:{radius},{lat},{lon});
              way["leisure"~"park|garden|sports_centre|stadium"](around:{radius},{lat},{lon});
              node["shop"~"mall|supermarket|department_store|gift"](around:{radius},{lat},{lon});
              way["shop"~"mall|supermarket|department_store|gift"](around:{radius},{lat},{lon});
            );
            out center;
            """
        else:
            # Search for specific amenity type
            query = f"""
            [out:json][timeout:15];
            (
              node["amenity"="{place_type}"](around:{radius},{lat},{lon});
              way["amenity"="{place_type}"](around:{radius},{lat},{lon});
            );
            out center;
            """
        
        try:
            print(f"Searching for {place_type} near {lat}, {lon}")
            response = requests.get(overpass_url, params={'data': query}, timeout=20)
            
            # Kiểm tra status code
            if response.status_code != 200:
                print(f"HTTP Error: {response.status_code}")
                return self._get_fallback_places(lat, lon, place_type)
            
            # Kiểm tra content type
            content_type = response.headers.get('content-type', '')
            if 'application/json' not in content_type:
                print(f"Invalid content type: {content_type}")
                return self._get_fallback_places(lat, lon, place_type)
            
            # Parse JSON
            try:
                data = response.json()
            except ValueError as e:
                print(f"JSON parsing error: {e}")
                print(f"Response text: {response.text[:200]}")
                return self._get_fallback_places(lat, lon, place_type)
            
            # Xử lý data
            places = []
            if 'elements' in data:
                for element in data['elements']:
                    if 'tags' in element and 'name' in element['tags']:
                        place_lat = element.get('lat') or element.get('center', {}).get('lat')
                        place_lon = element.get('lon') or element.get('center', {}).get('lon')
                        
                        if place_lat and place_lon:
                            distance = geodesic((lat, lon), (place_lat, place_lon)).meters
                            
                            # Xác định loại địa điểm với thứ tự ưu tiên
                            tags = element.get('tags', {})
                            place_type_display = (
                                tags.get('tourism') or 
                                tags.get('historic') or 
                                tags.get('amenity') or 
                                tags.get('leisure') or
                                tags.get('shop') or 
                                'place'
                            )
                            
                            # Dịch loại địa điểm sang tiếng Việt hoặc mô tả rõ hơn
                            place_type_vi = self._translate_place_type(place_type_display)
                            
                            places.append({
                                'name': tags.get('name', 'Unknown'),
                                'type': place_type_vi,
                                'lat': place_lat,
                                'lon': place_lon,
                                'address': tags.get('addr:street', tags.get('addr:full', 'Unknown')),
                                'distance': round(distance),
                                'description': tags.get('description', '')
                            })
            
            # Sắp xếp theo khoảng cách
            places.sort(key=lambda x: x['distance'])
            print(f"Found {len(places)} places")
            return places[:20]  # Giới hạn 20 địa điểm
            
        except requests.exceptions.Timeout:
            print("Request timeout - using fallback data")
            return self._get_fallback_places(lat, lon, place_type)
        except requests.exceptions.ConnectionError:
            print("Connection error - using fallback data")
            return self._get_fallback_places(lat, lon, place_type)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return self._get_fallback_places(lat, lon, place_type)
    
    def _get_fallback_places(self, lat, lon, place_type):
        """Trả về danh sách rỗng khi API fail"""
        
        # Trả về danh sách rỗng khi không tìm thấy
        return []
    
    def _translate_place_type(self, place_type):
        """Dịch loại địa điểm sang tiếng Việt và dễ hiểu hơn"""
        translations = {
            # Tourism
            'attraction': '🎯 Điểm tham quan',
            'museum': '🏛️ Bảo tàng',
            'monument': '🗿 Tượng đài',
            'viewpoint': '👁️ Điểm ngắm cảnh',
            'hotel': '🏨 Khách sạn',
            'hostel': '🏠 Nhà nghỉ',
            'guest_house': '🏡 Nhà khách',
            'artwork': '🎨 Tác phẩm nghệ thuật',
            
            # Historic
            'castle': '🏰 Lâu đài',
            'ruins': '🏚️ Di tích',
            'archaeological_site': '⛏️ Khu khảo cổ',
            'memorial': '🕯️ Đài tưởng niệm',
            
            # Amenity
            'restaurant': '🍽️ Nhà hàng',
            'cafe': '☕ Quán cà phê',
            'bar': '🍺 Quán bar',
            'pub': '🍻 Quán rượu',
            'theatre': '🎭 Nhà hát',
            'cinema': '🎬 Rạp phim',
            'library': '📚 Thư viện',
            'university': '🎓 Trường đại học',
            
            # Leisure
            'park': '🌳 Công viên',
            'garden': '🌸 Vườn',
            'sports_centre': '⚽ Trung tâm thể thao',
            'stadium': '🏟️ Sân vận động',
            
            # Shop
            'mall': '🛍️ Trung tâm mua sắm',
            'supermarket': '🛒 Siêu thị',
            'department_store': '🏬 Cửa hàng bách hóa',
            'gift': '🎁 Cửa hàng quà tặng',
        }
        
        return translations.get(place_type, f'📍 {place_type.title()}')
    
    def create_map_html(self, lat, lon, places, location_name):
        """Tạo bản đồ HTML"""
        m = folium.Map(
            location=[lat, lon],
            zoom_start=15,
            tiles='OpenStreetMap'
        )
        
        # Marker chính
        folium.Marker(
            [lat, lon],
            popup=f"📍 {location_name}",
            tooltip="📍 Your searched location",
            icon=folium.Icon(color='red', icon='star')
        ).add_to(m)
        
        # Thêm các địa điểm
        colors = ['blue', 'green', 'purple', 'orange', 'darkblue']
        for i, place in enumerate(places):
            color = colors[i % len(colors)]
            
            popup_html = f"""
            <div style="width:200px">
                <h4>{place['name']}</h4>
                <p><b>Type:</b> {place['type']}</p>
                <p><b>Distance:</b> {place['distance']}m</p>
                <p><b>Address:</b> {place['address']}</p>
            </div>
            """
            
            folium.Marker(
                [place['lat'], place['lon']],
                popup=folium.Popup(popup_html, max_width=250),
                tooltip=f"{place['name']} ({place['distance']}m)",
                icon=folium.Icon(color=color, icon='info-sign')
            ).add_to(m)
        
        return m._repr_html_()

map_service = MapService()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/search', methods=['POST'])
def search_location():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'})
            
        location = data.get('location', '')
        place_type = data.get('type', 'restaurant')
        
        if not location:
            return jsonify({'success': False, 'error': 'Location required'})
        
        print(f"Searching for {place_type} near {location}")
        
        # Geocoding
        geo_result = map_service.geocode(location)
        if not geo_result['success']:
            return jsonify(geo_result)
        
        lat, lon = geo_result['lat'], geo_result['lon']
        print(f"Coordinates: {lat}, {lon}")
        
        # Tìm địa điểm gần đó
        places = map_service.find_nearby_places(lat, lon, place_type)
        print(f"Found {len(places)} places")
        
        # Tạo bản đồ HTML
        map_html = map_service.create_map_html(lat, lon, places, location)
        
        return jsonify({
            'success': True,
            'location': geo_result,
            'places': places,
            'map_html': map_html,
            'message': f'Found {len(places)} places near {location}'
        })
        
    except Exception as e:
        print(f"API Error: {e}")
        return jsonify({
            'success': False, 
            'error': f'Server error: {str(e)}'
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)