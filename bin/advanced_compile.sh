python closure-tools/closure/bin/build/closurebuilder.py --root closure-tools --root ../src --namespace "appjs" --output_mode=compiled --compiler_jar=closure-tools/compiler.jar --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" > output/appjs.min.js
./move_outputs.sh
