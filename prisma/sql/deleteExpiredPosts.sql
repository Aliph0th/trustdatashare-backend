DELETE
FROM "data"
WHERE
    ttl > 0
    AND created_at + ttl * INTERVAL '1 second' < CURRENT_TIMESTAMP
RETURNING id
