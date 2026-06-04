#!/bin/bash

# Script pour injecter le système i18n dans tous les fichiers HTML

# Fichiers à traiter
FILES=(
  "public/portails/employeur.html"
  "public/portails/candidat.html"
  "public/portails/admin.html"
)

for file in "${FILES[@]}"; do
  echo "Processing: $file"
  
  # Vérifier si les scripts i18n sont déjà présents
  if grep -q "i18n.js" "$file"; then
    echo "  → i18n already injected, skipping..."
    continue
  fi
  
  # Injecter les scripts i18n après le dernier <script> dans <head>
  # Chercher la dernière ligne <script> avant </head>
  sed -i '/<\/head>/i\    <script src="/static/i18n.js"><\/script>\n    <script src="/static/language-selector.js"><\/script>' "$file"
  
  echo "  ✓ i18n scripts injected"
done

echo "Done!"
