# ---------- dev ----------
FROM golang:1.25 AS dev
WORKDIR /app
RUN go install github.com/air-verse/air@latest
EXPOSE 3001
CMD ["air"]

# ---------- build ----------
FROM golang:1.25-alpine AS build
WORKDIR /app
COPY go.mod ./
COPY *.go ./
RUN go mod tidy && go build -o server .

# ---------- prod ----------
FROM alpine:3.19 AS prod
WORKDIR /app
COPY --from=build /app/server .
EXPOSE 3001
CMD ["./server"]
