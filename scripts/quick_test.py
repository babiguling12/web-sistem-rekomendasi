import requests
import json

def test_api():
    """Test the FastAPI endpoints"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing FastAPI endpoints...")
    print("=" * 40)
    
    # Test root endpoint
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
            print(f"   Response: {response.json()}")
        else:
            print("❌ Root endpoint failed")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to FastAPI server")
        print("   Make sure the server is running on localhost:8000")
        return False
    
    # Test destinations endpoint
    try:
        response = requests.get(f"{base_url}/destinations")
        if response.status_code == 200:
            print("✅ Destinations endpoint working")
            data = response.json()
            print(f"   Found {len(data.get('destinations', []))} destinations")
        else:
            print("❌ Destinations endpoint failed")
    except Exception as e:
        print(f"❌ Destinations test failed: {e}")
    
    # Test recommendation endpoint
    try:
        test_data = {
            "district": "Badung",
            "terrainType": "lowland",
            "timeOfDay": "afternoon",
            "activityLevel": "moderate",
            "latitude": -8.6500,
            "longitude": 115.2167
        }
        
        response = requests.post(f"{base_url}/recommend", json=test_data)
        if response.status_code == 200:
            print("✅ Recommendation endpoint working")
            data = response.json()
            destinations = data.get('destinations', [])
            print(f"   Generated {len(destinations)} recommendations")
            
            if destinations:
                print("   Top recommendation:")
                top = destinations[0]
                print(f"   - {top['name']} ({top['location']})")
                print(f"   - Distance: {top['distance']:.1f} km")
                print(f"   - Fitness Score: {top['fitness_score']:.3f}")
        else:
            print("❌ Recommendation endpoint failed")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Recommendation test failed: {e}")
    
    print("\n🎉 API testing completed!")
    return True

if __name__ == "__main__":
    test_api()
