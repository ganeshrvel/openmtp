module kalam

go 1.16

require (
	github.com/ganeshrvel/go-mtpfs v1.0.4-0.20221105040909-77ef22eca9ca
	github.com/ganeshrvel/go-mtpx v0.0.0-20221105041206-b8aa8311a1ed
	github.com/json-iterator/go v1.1.12
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
)

///##### Upgrade a package
//go get github.com/<org-name>/<package-name>@<git-commit-hash>

//example: go get github.com/ganeshrvel/go-mtpfs@<git-commit-hash>
//example: go get github.com/ganeshrvel/go-mtpx@<git-commit-hash>

///##### Use a local package
// replace github.com/ganeshrvel/go-mtpfs vxxxxxx-xxxxxxxxxx
// with ../go-mtpfs
