ALTER TABLE jobs
RENAME COLUMN logo_url to logo_filename;

DELIMITER $$

CREATE FUNCTION getjob(companyname VARCHAR(255))
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE job_id INT;

    SELECT j.job_id INTO job_id
    FROM jobs j
    WHERE j.company_name = companyname
    LIMIT 1;

    RETURN job_id;
END$$

DELIMITER ;
