workflow "New workflow" {
  on = "push"
  resolves = ["Deps"]
}

action "Deps" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  runs = "npm install"
}

action "Lint" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  runs = "npm run lint"
  needs = "Deps"
}

action "Test" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  runs = "npm t"
  needs = "Deps"
}

