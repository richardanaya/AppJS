./generate_templates.sh ${1:-en}
python closure-tools/closure/bin/build/closurebuilder.py --root closure-tools --root ../source/editor --namespace "cc.Editor" --output_mode=compiled --compiler_jar=closure-tools/compiler.jar --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" > output/cc-editor.js
./move_outputs.sh
