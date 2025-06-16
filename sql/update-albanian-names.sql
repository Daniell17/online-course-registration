-- Update existing students with Albanian names
UPDATE Students SET 
    first_name = 'Ardit', 
    last_name = 'Hoxha', 
    email = 'ardit.hoxha@email.com'
WHERE student_id = 1;

UPDATE Students SET 
    first_name = 'Klara', 
    last_name = 'Rama', 
    email = 'klara.rama@email.com'
WHERE student_id = 2;

UPDATE Students SET 
    first_name = 'Endrit', 
    last_name = 'Berisha', 
    email = 'endrit.berisha@email.com'
WHERE student_id = 3;

UPDATE Students SET 
    first_name = 'Elona', 
    last_name = 'Krasniqi', 
    email = 'elona.krasniqi@email.com'
WHERE student_id = 4;

UPDATE Students SET 
    first_name = 'Gentian', 
    last_name = 'Sulaj', 
    email = 'gentian.sulaj@email.com'
WHERE student_id = 5;

UPDATE Students SET 
    first_name = 'Brunilda', 
    last_name = 'Gashi', 
    email = 'brunilda.gashi@email.com'
WHERE student_id = 6;

UPDATE Students SET 
    first_name = 'Besnik', 
    last_name = 'Vuçitërna', 
    email = 'besnik.vucitterna@email.com'
WHERE student_id = 7;

UPDATE Students SET 
    first_name = 'Manjola', 
    last_name = 'Kastrati', 
    email = 'manjola.kastrati@email.com'
WHERE student_id = 8;

-- Verify the changes
SELECT student_id, first_name, last_name, email FROM Students ORDER BY student_id;
    first_name = 'Manjola', 
    last_name = 'Kastrati', 
    email = 'manjola.kastrati@email.com',
    phone = '+355671234574'
WHERE student_id = 8;
