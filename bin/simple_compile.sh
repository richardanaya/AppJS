python closure-tools/closure/bin/build/closurebuilder.py --root closure-tools --root ../src/ --namespace "appjs" --output_mode=compiled --compiler_jar=closure-tools/compiler.jar > output/appjs.min.js
./move_outputs.sh
