## **UNDER DEVELOPMENT!**

## Compatibility

At the moment the module is compatible with `QSEoW` version `April 2019` (all patches)

In the next iterations the methods will be adapted to the latter version. Each iteration will be compatible with specific version of `QSEoW`.

---

**NOT AFFILIATED WITH QLIK**

---

## Methods

Full list of available methods can be found [here](https://informatiqal.github.io/qlik-repo-api/classes/QlikRepoApi.html)

## Generic clients

The package expose two extra (generic) methods. Generic methods that are not bound to specific method/object. Aka raw methods. For them at least `url` and `body` (for `Post` and `Put` methods) must be provided

- repoClient - client that uses `/qrs` as prefix. The required `url` should be passed without the prefix
- genericClient - client that have no prefix. Usually used for downloading temporary files
