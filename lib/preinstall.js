// This is the thing that figures out the tree that we're
// going to install with `npm install`
// Probably should be called as a util, but if called as the
// top-level command, it will print out the json of the object
// that will be passed to the cb
module.exports = preinstall

var install = require("./install.js")

preinstall.usage = "npm preinstall [args]"

preinstall.completion = install.completion

var npm = require("./npm.js")
  , semver = require("semver")
  , readJson = require("read-package-json")
  , readInstalled = require("read-installed")
  , log = require("npmlog")
  , path = require("path")
  , fs = require("graceful-fs")
  , isGitUrl = require("./utils/is-git-url.js")
  , cache = require("./cache.js")
  , url = require("url")

function preinstall (args, silent, cb) {
  if (typeof silent === "function") {
    cb = silent
    silent = false
  }

  var hasArgs = !!args.length
  var global = npm.config.get("global")

  // the /path/to/node_modules/..
  var where = path.resolve(npm.dir, "..")

  if (!global) {
    args = args.filter(function (a) {
      return path.resolve(a) !== where
    })
  }

  if (!hasArgs && global) {
    args = ["."]
    hasArgs = true
  }

  var ctx =
    { silent: silent
    , args: args
    , root: where
    , need: []
    , current: {}
    }

  readInstalled(where, function (er, current) {
    if (er) {
      return cb(er)
    }

    ctx.current = current

    if (!hasArgs) {
      piPackageJson(ctx, cb)
    } else {
      piArgs(ctx, cb)
    }
  })
}

function piPackageJson (ctx, cb) {
  // read what's in package.json, then skip anything that is
  // not satisfactory
  var pj = path.resolve(ctx.where, "package.json")
  readJson(pj, log.warn, function (er, data) {
    // if we're not in --production mode, then also do devs
    var deps = data.dependencies || {}
    var optional = data.optionalDependencies || {}
    var dev = data.devDependencies || {}
    var args = ctx.args = []
    addDepArgs(ctx, deps)
    if (!npm.config.get("production")) {
      addDepArgs(ctx, devs)
    }
    if (npm.config.get("optional")) {
      addDepArgs(ctx, optional)
    }

    piArgs(ctx, cb)
  })
}

function addDepArgs (ctx, deps) {
  for (var i in deps) {
    if (!ctx.current.dependencies[i]) {
      ctx.args.push(i + "@" + deps[i])
    }
  }
}

function piArgs (ctx, cb) {
  var args = ctx.args
  var errState = null
  var n = args.length

  if (!n) {
    return process.nextTick(cb.bind(null, ctx))
  }

  args.forEach(function (arg) {
    piArg(arg, ctx, next)
  })

  function next (er) {
    if (errState) return
    else if (er) return cb(errState = er)
    else if (--n === 0) return cb(null, ctx)
  }
}

function piArg (arg, ctx, cb) {
  // figure out what this is.
  // if it's a url, file, or git, then add to cache
  // otherwise, just look it up
  var parsed = url.parse(arg)
}
