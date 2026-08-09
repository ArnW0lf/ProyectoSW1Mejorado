#!/usr/bin/env bash

# Instalar dependencias
echo "--- Instalando dependencias ---"
pip install -r requirements.txt

# Recolectar archivos estáticos
echo "--- Recolectando archivos estáticos ---"
python manage.py collectstatic --noinput

# Aplicar migraciones a la base de datos
echo "--- Aplicando migraciones de base de datos ---"
python manage.py migrate