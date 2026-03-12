import os

file_path = r"extracted_content\Առաջադրանքներ\practice1-discrete.txt"

try:
    with open(file_path, "rb") as f:
        content = f.read(100)
        print(f"First 100 bytes: {content}")
        try:
            print(f"Decoded as utf-8: {content.decode('utf-8')}")
        except Exception as e:
            print(f"Failed to decode as utf-8: {e}")
except Exception as e:
    print(f"Error reading file: {e}")
