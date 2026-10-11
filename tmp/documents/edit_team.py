from pathlib import Path
from docx import Document
from docx.shared import Pt

root = Path(__file__).resolve().parents[2]
path = root / 'output' / 'documents' / 'Hoja de ruta Batalla Naval.docx'
doc = Document(path)

replacements = {
    'Este plan organiza el desarrollo del obligatorio para un equipo de dos integrantes. El objetivo es tener el software completo el 9 de noviembre y entregar el proyecto el 16 de noviembre de 2026.':
        'Este plan organiza el desarrollo del obligatorio de Edgar y Pierino. El objetivo es tener el software completo el 9 de noviembre y entregar el proyecto el 16 de noviembre de 2026.',
    'Integrante A ____________________    Integrante B ____________________':
        'Integrantes  Edgar y Pierino',
    'En cada hito asignamos un responsable y un revisor; podemos alternar los roles. Ambos revisamos la evidencia y debemos comprender la solución completa.':
        'Los dos trabajamos en cada hito y anotamos qué partes hace cada uno. Ambos revisamos la evidencia y debemos comprender la solución completa.',
    'Marcamos una casilla cuando el criterio está comprobado. Cerramos un hito cuando todas sus casillas están verificadas por ambos y registramos la fecha real. Las fechas son objetivos; el estado se completa según el avance efectivo.':
        'Marcamos una casilla cuando el criterio está comprobado. Cumplimos un hito cuando todas sus casillas están verificadas por ambos. Las fechas son objetivos; las casillas reflejan el avance efectivo.',
    'Responsable __________________    Revisor __________________':
        'Edgar  Partes del hito ______________________________________________',
    'Estado _______________________    Fecha real de cierre __________':
        'Pierino  Partes del hito _____________________________________________',
}
counts = {text: 0 for text in replacements}
for p in doc.paragraphs:
    old = p.text
    if old in replacements:
        size = p.runs[0].font.size if p.runs else None
        p.text = replacements[old]
        if size:
            for run in p.runs:
                run.font.size = size
        counts[old] += 1

assert list(counts.values()) == [1, 1, 1, 1, 8, 8], counts
doc.core_properties.author = 'Edgar y Pierino'
doc.save(path)
print('Actualizados 8 hitos con espacios para las partes de Edgar y Pierino.')
print('Se conservaron las checklists y las fechas objetivo.')
