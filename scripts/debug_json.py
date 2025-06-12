import json
import os

def show_json_sample():
    """Show actual JSON content to understand the structure"""
    
    json_path = os.path.join("backend", "places.json")
    
    if not os.path.exists(json_path):
        print(f"❌ places.json not found at {json_path}")
        return
    
    with open(json_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            print(f"✅ JSON loaded successfully")
            print(f"📊 Data type: {type(data)}")
            print(f"📏 Data length: {len(data) if isinstance(data, (list, dict)) else 'N/A'}")
            
            # Show structure
            if isinstance(data, list):
                print(f"\n📋 Array with {len(data)} items")
                if data:
                    print("📄 First item:")
                    print(json.dumps(data[0], indent=2, ensure_ascii=False)[:500] + "...")
                    
            elif isinstance(data, dict):
                print(f"\n📋 Object with keys: {list(data.keys())}")
                for key, value in data.items():
                    print(f"   - {key}: {type(value)} (length: {len(value) if isinstance(value, (list, dict)) else 'N/A'})")
                    
                    # Show sample of array values
                    if isinstance(value, list) and value:
                        print(f"     Sample item from {key}:")
                        print(json.dumps(value[0], indent=6, ensure_ascii=False)[:300] + "...")
                        break
                        
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {str(e)}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    show_json_sample()
