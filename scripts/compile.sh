./generate_templates.sh ${1:-en}
python closure-tools/closure/bin/build/closurebuilder.py --root closure-tools --namespace "cc.Editor" --root ../source/editor --output_mode=script --compiler_jar=closure-tools/compiler.jar > output/cc-editor.js
./move_outputs.sh
