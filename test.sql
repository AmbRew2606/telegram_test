SELECT s.name, COUNT(t.id) as topic, COUNT(q.id) as questions FROM sections s JOIN topics t ON s.id = t.section_id JOIN questions q ON t.id = q.topic_id GROUP BY s.name;




SELECT 
  s.name, 
  COUNT(DISTINCT t.id) AS topic, 
  COUNT(q.id) AS questions
FROM sections s
LEFT JOIN topics t ON s.id = t.section_id
LEFT JOIN questions q ON t.id = q.topic_id
GROUP BY s.name;