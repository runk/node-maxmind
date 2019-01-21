workflow "New workflow" {
  on = "push"
  resolves = ["GitHub Action for npm"]
}

action "GitHub Action for npm" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  secrets = ["GITHUB_TOKEN"]
  runs = "install"
}

workflow "New workflow 1" {
  on = "push"
}
