-- param {Int} $1:userID
-- param {Int} $2:offset
-- param {Int} $3:limit
-- param {Boolean} $4:visible
WITH
   posts AS (
      SELECT
         id,
         title,
         description,
         PASSWORD IS NULL AS "isPublic",
         owner_hidden AS "isOwnerHidden",
         created_at AS "createdAt",
         updated_at AS "updatedAt"
      FROM
         "data"
      WHERE
         owner_id = $1
         AND CASE
            WHEN $4 THEN NOT owner_hidden
            ELSE TRUE
         END
         AND (
            ttl = -1
            OR created_at + ttl * INTERVAL '1 second' >= CURRENT_TIMESTAMP
         )
      ORDER BY
         created_at
   )
SELECT
   (
      SELECT
         COUNT(*) AS "total"
      FROM
         posts
   ),
   *
FROM
   posts
OFFSET
   $2
LIMIT
   $3
