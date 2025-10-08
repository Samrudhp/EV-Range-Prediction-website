#!/bin/bash

# Model Cache Status Checker for EV Range Prediction Platform

echo ""
echo "=================================================="
echo "🗄️  Model Cache Status Checker"
echo "=================================================="
echo ""

# Check GPT4All LLM cache
echo "1️⃣  GPT4All LLM (Mistral-7B)"
echo "   Location: ~/.cache/gpt4all/"
if [ -f ~/.cache/gpt4all/mistral-7b-instruct-v0.2.Q4_0.gguf ]; then
    SIZE=$(du -sh ~/.cache/gpt4all/mistral-7b-instruct-v0.2.Q4_0.gguf 2>/dev/null | cut -f1)
    echo "   Status: ✅ CACHED ($SIZE)"
else
    echo "   Status: ❌ NOT CACHED (will download ~4GB on first run)"
fi

echo ""

# Check Sentence Transformers embeddings cache
echo "2️⃣  Sentence Transformers (Embeddings)"
echo "   Location: ~/.cache/torch/sentence_transformers/"
if [ -d ~/.cache/torch/sentence_transformers/sentence-transformers_all-MiniLM-L6-v2 ]; then
    echo "   Status: ✅ CACHED"
else
    echo "   Status: ❌ NOT CACHED (will download ~90MB on first run)"
fi

echo ""

# Total cache size
echo "3️⃣  Total Cache Size"
TOTAL_SIZE=$(du -sh ~/.cache/gpt4all/ ~/.cache/torch/sentence_transformers/ 2>/dev/null | awk '{sum+=$1} END {print sum}')
if [ -n "$TOTAL_SIZE" ]; then
    du -sh ~/.cache/gpt4all/ ~/.cache/torch/sentence_transformers/ 2>/dev/null | sed 's/^/   /'
else
    echo "   No models cached yet"
fi

echo ""
echo "=================================================="

# Check disk space
echo "4️⃣  Available Disk Space"
df -h ~ | tail -1 | awk '{print "   Available: " $4 " (Need: 10GB+ recommended)"}'

echo ""
echo "=================================================="
echo ""

# Summary
echo "📋 Summary:"
if [ -f ~/.cache/gpt4all/mistral-7b-instruct-v0.2.Q4_0.gguf ] && [ -d ~/.cache/torch/sentence_transformers/sentence-transformers_all-MiniLM-L6-v2 ]; then
    echo "   ✅ All models cached! Ready to run instantly."
    echo "   ⚡ Server startup: ~5-10 seconds"
elif [ -f ~/.cache/gpt4all/mistral-7b-instruct-v0.2.Q4_0.gguf ]; then
    echo "   ⚠️  LLM cached, embeddings will download (~90MB, 1-2 min)"
elif [ -d ~/.cache/torch/sentence_transformers/sentence-transformers_all-MiniLM-L6-v2 ]; then
    echo "   ⚠️  Embeddings cached, LLM will download (~4GB, 15-30 min)"
else
    echo "   ⏳ First run will download all models (~4.2GB, 15-40 min)"
    echo "   💡 Subsequent runs will be instant!"
fi

echo ""
echo "=================================================="
echo ""

# Quick commands
echo "🔧 Quick Commands:"
echo "   View LLM cache:        ls -lh ~/.cache/gpt4all/"
echo "   View embeddings cache: ls -lh ~/.cache/torch/sentence_transformers/"
echo "   Clear all caches:      rm -rf ~/.cache/gpt4all/ ~/.cache/torch/sentence_transformers/"
echo "   Start server:          python -m app.main"
echo ""
