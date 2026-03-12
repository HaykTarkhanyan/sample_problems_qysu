import os
from pypdf import PdfReader

def extract_text_from_pdfs(root_dir, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".pdf"):
                file_path = os.path.join(subdir, file)
                print(f"Processing: {file_path}")
                
                try:
                    reader = PdfReader(file_path)
                    text = ""
                    for page in reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                             # Filter out control characters that might make the file "binary"
                            cleaned_text = "".join(ch for ch in page_text if ord(ch) >= 32 or ch in ('\n', '\r', '\t'))
                            text += cleaned_text + "\n"
                    
                    # Create a mirrored structure in output_dir or just flat file names
                    # Let's verify the relative path
                    rel_path = os.path.relpath(subdir, root_dir)
                    output_subdir = os.path.join(output_dir, rel_path)
                    if not os.path.exists(output_subdir):
                        os.makedirs(output_subdir)

                    output_filename = os.path.splitext(file)[0] + ".txt"
                    output_path = os.path.join(output_subdir, output_filename)
                    
                    with open(output_path, "w", encoding="utf-8") as f:
                        f.write(text)
                    print(f"Saved text to: {output_path}")
                except Exception as e:
                    print(f"Error processing {file}: {e}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # The folders are in the same directory as this script based on the previous context
    # "c:\Users\hayk_\OneDrive\Desktop\sample_problems_qysu\discrete"
    
    # We will look for pdfs in the current directory and subdirectories
    extract_text_from_pdfs(current_dir, os.path.join(current_dir, "extracted_content"))
