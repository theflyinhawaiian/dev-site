CREATE TABLE jobs (
    job_id INT NOT NULL AUTO_INCREMENT,
    company_name VARCHAR(255),
    title VARCHAR(255),
    description VARCHAR(1024),
    logo_url VARCHAR(255),
    PRIMARY KEY (job_id)
);

CREATE TABLE job_tags (
    job_id INT,
    tag_id INT,
    PRIMARY KEY (job_id, tag_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
);