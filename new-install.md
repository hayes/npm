Stages:

1. identify what needs to be installed
   - read existing node_modules to get existing state.
   - Start with either package.json, or a list of arguments.
   - For each pkg, get data obj, resolve to a final "resolved" url
     - **name[@version/tag]** Resolve to data obj and tgz url
     - **git** Add to cache (can't read deps otherwise)
     - **tgz url/file** Add to cache (can't read deps)
   - Set pkg in goal tree, recurse to unsatisfied deps
   - Result is a "goal tree", and a tree of the existing state

2. dedupe tree

3. analyze the parts of the intended tree that differ from existing
   state.  Result = list of packages that need to be installed.

4. Add all tarballs to cache

5. unpack tree onto filesystem for all packages in list

6. create symlinks for bins etc

7. DFS traversal running scripts
   - preinstall
   - (walk children)
   - install
   - postinstall
