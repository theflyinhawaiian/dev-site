package main

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var (
	db          *sql.DB
	errNotFound = errors.New("not found")
)

type ProjectLink struct {
	Title string `json:"title"`
	Link  string `json:"link"`
}

type Tag struct {
	Slug    string `json:"slug"`
	Name    string `json:"name"`
	Postfix string `json:"postfix"`
}

type Project struct {
	Name         string        `json:"name"`
	Description  string        `json:"description"`
	ProjectLinks []ProjectLink `json:"projectLinks"`
	Tags         []Tag         `json:"tags"`
}

type Job struct {
	CompanyName  string `json:"companyName"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	LogoFilename string `json:"logoFilename"`
	Tags         []Tag  `json:"tags"`
}

func initDB() error {
	host := getEnv("MYSQL_HOST", "mysql:3306")
	parts := strings.SplitN(host, ":", 2)
	dbHost, dbPort := parts[0], "3306"
	if len(parts) == 2 {
		dbPort = parts[1]
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s",
		getEnv("MYSQL_USER", "devsite_user"),
		getSecret(os.Getenv("MYSQL_PASSWORD_FILE"), ""),
		dbHost, dbPort,
		getEnv("MYSQL_DATABASE", "devsite_db"),
	)

	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		return err
	}

	for i := range 30 {
		if err = db.Ping(); err == nil {
			return nil
		}
		log.Printf("waiting for database (attempt %d/30): %v", i+1, err)
		time.Sleep(time.Second)
	}
	return err
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getSecret(path, fallback string) string {
	if path == "" {
		return fallback
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return fallback
	}
	return strings.TrimSpace(string(data))
}

func getProjects() ([]Project, error) {
	tagRows, err := db.Query(`
		SELECT projects.name, tags.name, tags.slug, tags.postfix
		FROM projects
		INNER JOIN project_tags ON projects.project_id = project_tags.project_id
		INNER JOIN tags ON tags.tag_id = project_tags.tag_id`)
	if err != nil {
		return nil, err
	}
	defer tagRows.Close()

	tagMap := map[string][]Tag{}
	for tagRows.Next() {
		var projectName, tagName, tagSlug, tagPostfix string
		if err := tagRows.Scan(&projectName, &tagName, &tagSlug, &tagPostfix); err != nil {
			return nil, err
		}
		tagMap[projectName] = append(tagMap[projectName], Tag{Slug: tagSlug, Name: tagName, Postfix: tagPostfix})
	}
	if err := tagRows.Err(); err != nil {
		return nil, err
	}

	rows, err := db.Query(`
		SELECT name, description, project_link1, project_link1_title, project_link2, project_link2_title, hosted_link, hosted_title
		FROM projects`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projects := []Project{}
	for rows.Next() {
		var name, desc, link1, link1T, link2, link2T, hostedLink, hostedT string
		if err := rows.Scan(&name, &desc, &link1, &link1T, &link2, &link2T, &hostedLink, &hostedT); err != nil {
			return nil, err
		}
		tags := tagMap[name]
		if tags == nil {
			tags = []Tag{}
		}
		projects = append(projects, Project{
			Name:        name,
			Description: desc,
			ProjectLinks: []ProjectLink{
				{Title: link1T, Link: link1},
				{Title: link2T, Link: link2},
				{Title: hostedT, Link: hostedLink},
			},
			Tags: tags,
		})
	}
	return projects, rows.Err()
}

func getJobs() ([]Job, error) {
	tagRows, err := db.Query(`
		SELECT jobs.company_name, tags.name, tags.slug, tags.postfix
		FROM jobs
		INNER JOIN job_tags ON jobs.job_id = job_tags.job_id
		INNER JOIN tags ON tags.tag_id = job_tags.tag_id`)
	if err != nil {
		return nil, err
	}
	defer tagRows.Close()

	tagMap := map[string][]Tag{}
	for tagRows.Next() {
		var companyName, tagName, tagSlug, tagPostfix string
		if err := tagRows.Scan(&companyName, &tagName, &tagSlug, &tagPostfix); err != nil {
			return nil, err
		}
		tagMap[companyName] = append(tagMap[companyName], Tag{Slug: tagSlug, Name: tagName, Postfix: tagPostfix})
	}
	if err := tagRows.Err(); err != nil {
		return nil, err
	}

	rows, err := db.Query("SELECT company_name, title, description, logo_filename FROM jobs")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	jobs := []Job{}
	for rows.Next() {
		var companyName, title, desc, logoFilename string
		if err := rows.Scan(&companyName, &title, &desc, &logoFilename); err != nil {
			return nil, err
		}
		tags := tagMap[companyName]
		if tags == nil {
			tags = []Tag{}
		}
		jobs = append(jobs, Job{
			CompanyName:  companyName,
			Title:        title,
			Description:  desc,
			LogoFilename: logoFilename,
			Tags:         tags,
		})
	}
	return jobs, rows.Err()
}

func getJob(id int) (*Job, error) {
	var jobID int
	var companyName, title, desc, logoFilename string
	err := db.QueryRow(
		"SELECT job_id, company_name, title, description, logo_filename FROM jobs WHERE job_id = ?", id,
	).Scan(&jobID, &companyName, &title, &desc, &logoFilename)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, errNotFound
	}
	if err != nil {
		return nil, err
	}

	tagRows, err := db.Query(`
		SELECT tags.name, tags.slug, tags.postfix
		FROM job_tags
		INNER JOIN tags ON tags.tag_id = job_tags.tag_id
		WHERE job_tags.job_id = ?`, jobID)
	if err != nil {
		return nil, err
	}
	defer tagRows.Close()

	tags := []Tag{}
	for tagRows.Next() {
		var tagName, tagSlug, tagPostfix string
		if err := tagRows.Scan(&tagName, &tagSlug, &tagPostfix); err != nil {
			return nil, err
		}
		tags = append(tags, Tag{Slug: tagSlug, Name: tagName, Postfix: tagPostfix})
	}
	if err := tagRows.Err(); err != nil {
		return nil, err
	}

	return &Job{
		CompanyName:  companyName,
		Title:        title,
		Description:  desc,
		LogoFilename: logoFilename,
		Tags:         tags,
	}, nil
}
