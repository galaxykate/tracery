
file_list = Dir["lib/*.rb"]
test_file_list = Dir["test/*.rb"]

Gem::Specification.new do |s|
  s.name        = "tracery"
  s.version     = "0.7.1"
  s.date        = "2016-02-27"
  s.summary     = "A text expansion library"
  s.description = <<EOF
Tracery is a library for text generation.
The text is expanded by traversing a grammar.
See the main github repo for examples and documentation.
EOF
  s.authors     = ["Kate Compton", "Eli Brody"]
  s.email       = "brodyeli@gmail.com"
  s.files       = file_list
  s.test_files  = test_file_list
  s.homepage    = "https://github.com/elib/tracery/tree/feature/rubyPort/ruby"
  s.license     = "Apache-2.0"
end