-- Mettre les crédits de l'employeur 2 à zéro pour tester
UPDATE employer_credits 
SET credits_remaining = 0, unlimited_until = NULL 
WHERE user_id = 2;
