-- param {Int} $1:userID
-- param {Int} $2:offset
-- param {Int} $3:limit
WITH
    posts AS (
        SELECT
            id,
            title,
            description,
            password IS NULL AS "isPublic",
            owner_hidden AS "isOwnerHidden",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        FROM "data"
        WHERE
            owner_id = $1
            AND (
                ttl = -1
                OR created_at + ttl * INTERVAL '1 second' >= CURRENT_TIMESTAMP
            )
    )
SELECT (
        SELECT COUNT(*) AS "total"
        FROM posts
    ), *
FROM posts
OFFSET $2
LIMIT $3
