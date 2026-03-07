#!/usr/bin/env python3
"""
Extrae los 155 capítulos de RAYUELA.pdf a archivos Markdown individuales.
Usa PyMuPDF (fitz) para extracción rápida.
"""

import fitz  # PyMuPDF
import re
import os
import sys

PDF_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'RAYUELA.pdf')
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'data', 'chapters')


def extract_chapters():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    print(f"PDF abierto: {total_pages} paginas")
    
    # Phase 1: Extract all text quickly
    pages_text = []
    for i in range(total_pages):
        page = doc[i]
        text = page.get_text("text")
        pages_text.append(text if text else "")
    
    print(f"Texto extraido de {total_pages} paginas")
    
    # Phase 2: Identify chapter boundaries
    # PyMuPDF pattern: L0=chapter_num, L1=blank, L2=page_num, L3=chapter_num (repeated on first page)
    chapter_starts = []
    
    for i in range(total_pages):
        text = pages_text[i]
        if not text:
            continue
        lines = text.strip().split('\n')
        if len(lines) >= 4:
            l0 = lines[0].strip()
            l3 = lines[3].strip()
            if (l0 == l3 and l0.isdigit() and 1 <= int(l0) <= 155):
                ch_num = int(l0)
                if not chapter_starts or chapter_starts[-1][0] != ch_num:
                    chapter_starts.append((ch_num, i))
    
    chapter_starts.sort(key=lambda x: x[1])
    
    print(f"Capitulos encontrados: {len(chapter_starts)}")
    
    expected = set(range(1, 156))
    got = set(ch for ch, _ in chapter_starts)
    missing = expected - got
    if missing:
        print(f"Capitulos faltantes: {sorted(missing)}")
    
    # Phase 3: Extract text for each chapter
    chapters_written = 0
    
    for idx, (ch_num, start_page) in enumerate(chapter_starts):
        if idx + 1 < len(chapter_starts):
            end_page = chapter_starts[idx + 1][1]
        else:
            end_page = total_pages
        
        chapter_text_parts = []
        
        for p in range(start_page, end_page):
            text = pages_text[p]
            if not text:
                continue
            
            lines = text.strip().split('\n')
            
            if p == start_page:
                # Skip header: L0=ch_num, L1=blank, L2=page_num, L3=ch_num
                content_lines = lines[4:]
            else:
                # Continuation: L0=ch_num, L1=blank, L2=page_num
                if len(lines) >= 3 and lines[0].strip().isdigit():
                    content_lines = lines[3:]
                else:
                    content_lines = lines
            
            skip_headers = {
                'DEL LADO DE ALLÁ', 'DEL LADO DE ALLLA', 'DEL LADO DE ALLA',
                'DEL LADO DE ACÁ', 'DEL LADO DE ACA',
                'DE OTROS LADOS', 'CAPÍTULOS PRESCINDIBLES',
                'CAPITULOS PRESCINDIBLES'
            }
            filtered = []
            for line in content_lines:
                stripped = line.strip().upper()
                if stripped in skip_headers:
                    continue
                filtered.append(line)
            
            chapter_text_parts.append('\n'.join(filtered))
        
        full_text = '\n'.join(chapter_text_parts)
        full_text = re.sub(r'(\w)-\n\s*(\w)', r'\1\2', full_text)
        full_text = re.sub(r'\n{3,}', '\n\n', full_text)
        full_text = full_text.strip()
        
        if ch_num <= 36:
            section = "Del lado de alla"
        elif ch_num <= 56:
            section = "Del lado de aca"
        else:
            section = "De otros lados (Capitulos prescindibles)"
        
        filename = f"{ch_num:03d}.md"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"# Capitulo {ch_num}\n\n")
            f.write(f"> *{section}*\n\n")
            f.write(full_text)
            f.write('\n')
        
        chapters_written += 1
        if chapters_written % 20 == 0 or chapters_written <= 3 or ch_num >= 153:
            preview = full_text[:80].replace('\n', ' ')
            print(f"  Cap. {ch_num:>3} ({end_page - start_page} pag.) -> {filename}")
    
    doc.close()
    
    print(f"\nTotal: {chapters_written} capitulos extraidos a {OUTPUT_DIR}")
    
    if not missing:
        print("Todos los 155 capitulos encontrados")
    
    return chapters_written


if __name__ == '__main__':
    count = extract_chapters()
    sys.exit(0 if count == 155 else 1)
