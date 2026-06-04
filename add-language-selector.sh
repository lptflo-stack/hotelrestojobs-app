#!/bin/bash

# Script pour ajouter le sélecteur de langue dans les portails

echo "Adding language selector to portails..."

# Employeur portal
if grep -q "language-selector-container" public/portails/employeur.html; then
  echo "  → employeur.html: selector already exists"
else
  sed -i '/<div id="user-menu"/i\                <div id="language-selector-container"><\/div>' public/portails/employeur.html
  echo "  ✓ employeur.html: selector added"
fi

# Candidat portal  
if grep -q "language-selector-container" public/portails/candidat.html; then
  echo "  → candidat.html: selector already exists"
else
  sed -i '/<div id="user-menu"/i\                <div id="language-selector-container"><\/div>' public/portails/candidat.html
  echo "  ✓ candidat.html: selector added"
fi

# Admin portal
if grep -q "language-selector-container" public/portails/admin.html; then
  echo "  → admin.html: selector already exists"
else
  sed -i '/<div id="user-menu"/i\                <div id="language-selector-container"><\/div>' public/portails/admin.html
  echo "  ✓ admin.html: selector added"
fi

echo "Done!"
