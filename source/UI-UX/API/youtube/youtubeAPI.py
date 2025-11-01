import requests
import json
from typing import List, Dict
import webbrowser
import urllib.parse

def search_youtube_videos(location: str, max_results: int = 5) -> List[Dict]:
    """Search YouTube using Invidious API (alternative YouTube frontend)."""
    try:
        # Invidious instances (free YouTube API alternatives)
        instances = [
            "https://invidious.io",
            "https://y.com.sb", 
            "https://invidious.xamh.de"
        ]
        
        query = urllib.parse.quote_plus(f"{location} travel guide")
        
        for instance in instances:
            try:
                url = f"{instance}/api/v1/search?q={query}&type=video"
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    
                    videos = []
                    for item in data[:max_results]:
                        videos.append({
                            'title': item.get('title', 'Unknown'),
                            'channel': item.get('author', 'Unknown'),
                            'url': f"https://www.youtube.com/watch?v={item.get('videoId', '')}",
                            'duration': f"{item.get('lengthSeconds', 0)//60}:{item.get('lengthSeconds', 0)%60:02d}",
                            'views': f"{item.get('viewCount', 0):,} views"
                        })
                    return videos
            except:
                continue
        
        return []
        
    except Exception as e:
        print(f"Invidious API error: {e}")
        return []


def create_location_report(location: str):
    """Create a simple report with YouTube videos for a location."""
    print(f"🎥 Searching YouTube videos for: {location}")
    print("=" * 60)
    
    # Search videos using best method (Invidious API)
    videos = search_youtube_videos(location)
    
    if videos:
        print(f"\n� Found {len(videos)} videos:")
        for i, video in enumerate(videos, 1):
            print(f"\n{i}. {video['title']}")
            print(f"   👤 Channel: {video['channel']}")
            print(f"   ⏱️ Duration: {video['duration']}")
            print(f"   👀 Views: {video['views']}")
            print(f"   🔗 URL: {video['url']}")
    else:
        print("❌ No videos found")


if __name__ == "__main__":
    # Demo with Vietnamese locations
    locations = []
    while True:
        input_location = input("Enter the location (leave empty to finish): ").strip()
        if not input_location:
            break
        locations.append(input_location)
        
    
    for location in locations:
        create_location_report(location)
        print("\n" + "="*60 + "\n")
        input("Press Enter for next location...")