CREATE TABLE tags (
    tag_id INT NOT NULL AUTO_INCREMENT,
    slug VARCHAR(50),
    name VARCHAR(255),
    PRIMARY KEY (tag_id),
    UNIQUE (slug)
);

CREATE TABLE projects (
    project_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    description VARCHAR(1024),
    project_link1 VARCHAR(255),
    project_link2 VARCHAR(255),
    project_link1_title VARCHAR(255),
    project_link2_title VARCHAR(255),
    hosted_link VARCHAR(255),
    hosted_title VARCHAR(255),
    PRIMARY KEY (project_id)
);

CREATE TABLE project_images (
    image_id INT NOT NULL AUTO_INCREMENT,
    src varchar(1024) NOT NULL,
    project_id INT,
    PRIMARY KEY (image_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE project_tags (
    project_id INT,
    tag_id INT,
    PRIMARY KEY (project_id, tag_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
);

DELIMITER $$

CREATE FUNCTION gettag(slug VARCHAR(50))
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE tag_id INT;

    SELECT t.tag_id INTO tag_id
    FROM tags t
    WHERE t.slug = slug
    LIMIT 1;

    RETURN tag_id;
END$$

CREATE FUNCTION getproject(projname VARCHAR(255))
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE project_id INT;

    SELECT p.project_id INTO project_id
    FROM projects p
    WHERE p.name = projname
    LIMIT 1;

    RETURN project_id;
END$$

DELIMITER ;
