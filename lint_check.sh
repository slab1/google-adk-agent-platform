#!/bin/bash

echo "🔍 Running basic lint checks..."

# Check for console.log statements (excluding test files and examples)
echo "Checking for console.log statements..."
if grep -r "console\.log" /workspace/frontend/src --exclude-dir=test --exclude-dir=node_modules | grep -v "TODO" | grep -v "console.error" | grep -v "console.warn"; then
    echo "⚠️  Found console.log statements that should be removed or replaced"
else
    echo "✅ No console.log statements found"
fi

# Check for TODO comments that should be addressed
echo "Checking for TODO comments..."
if grep -r "TODO" /workspace/frontend/src --exclude-dir=test --exclude-dir=node_modules | wc -l | grep -v "^0$"; then
    echo "📝 Found TODO comments that should be addressed"
else
    echo "✅ No TODO comments found"
fi

# Check for unused imports (basic check)
echo "Checking for potentially unused imports..."
for file in /workspace/frontend/src/**/*.tsx; do
    if [ -f "$file" ]; then
        # Extract imports and check if they're used (basic heuristic)
        imports=$(grep "^import.*from" "$file" 2>/dev/null | sed "s/.*from '\([^']*\)'.*/\1/" | sort -u)
        for import in $imports; do
            if [[ $import != "'react'" && $import != "'lucide-react'" && $import != "react-router-dom" ]]; then
                basename=$(basename "$import" .tsx .ts)
                if ! grep -q "$basename" "$file"; then
                    echo "⚠️  Potentially unused import in $file: $import"
                fi
            fi
        done
    fi
done

# Check for missing semicolons (JavaScript/TypeScript style)
echo "Checking for missing semicolons..."
if grep -r ";$" /workspace/frontend/src --exclude-dir=test --exclude-dir=node_modules | grep -v "};$" | grep -v "];$" | grep -v ");$" | head -5; then
    echo "📝 Found statements that might be missing semicolons"
else
    echo "✅ Statement formatting looks good"
fi

echo "✅ Basic lint check completed!"
echo ""
echo "📋 Summary:"
echo "  - Remove any console.log statements for production"
echo "  - Address TODO comments as needed"
echo "  - Review potential unused imports"
echo "  - Ensure consistent code formatting"