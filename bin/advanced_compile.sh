python closure-tools/closure/bin/build/closurebuilder.py --root closure-tools --root ../src --namespace "AppLayout" --output_mode=compiled --compiler_jar=closure-tools/compiler.jar --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" > output/applayout.min.js
./move_outputs.sh
