# 🗄️ Model Cache Information

## Overview
All AI models are cached locally to avoid re-downloading on every run. This saves time and bandwidth.

---

## 📦 Cache Locations

### 1. GPT4All LLM (Mistral-7B)
**Location**: `~/.cache/gpt4all/`

**Full Path**:
```bash
~/.cache/gpt4all/mistral-7b-instruct-v0.2.Q4_0.gguf
```

**Size**: ~4GB (one-time download)

**Check if cached**:
```bash
ls -lh ~/.cache/gpt4all/
```

**Expected output**:
```
-rw-r--r-- 1 user staff 4.1G Oct  8 2025 mistral-7b-instruct-v0.2.Q4_0.gguf
```

### 2. Sentence Transformers (Embeddings)
**Location**: `~/.cache/torch/sentence_transformers/`

**Full Path**:
```bash
~/.cache/torch/sentence_transformers/sentence-transformers_all-MiniLM-L6-v2/
```

**Size**: ~90MB (one-time download)

**Check if cached**:
```bash
ls -lh ~/.cache/torch/sentence_transformers/
```

**Expected output**:
```
drwxr-xr-x 8 user staff 256B Oct  8 2025 sentence-transformers_all-MiniLM-L6-v2
```

---

## ⚙️ How Caching Works

### GPT4All
```python
from gpt4all import GPT4All

# Automatically checks ~/.cache/gpt4all/ first
# If model exists: loads from cache (fast!)
# If not: downloads to cache (one-time, ~10-30 min)
model = GPT4All(
    model_name='mistral-7b-instruct-v0.2.Q4_0.gguf',
    allow_download=True,  # Downloads if not cached
    device='cpu'
)
```

### Sentence Transformers
```python
from sentence_transformers import SentenceTransformer

# Automatically checks ~/.cache/torch/sentence_transformers/ first
# If model exists: loads from cache (fast!)
# If not: downloads to cache (one-time, ~1-2 min)
embedder = SentenceTransformer(
    'all-MiniLM-L6-v2',
    cache_folder=None  # Uses default cache location
)
```

---

## 🚀 First Run vs Subsequent Runs

### First Run (No Cache)
```bash
cd backend-ai
source venv/bin/activate
python -m app.main

# Output:
# 📥 Downloading Mistral-7B model (one-time, ~4GB)...
# Downloading: 100% |███████████████| 4.1GB/4.1GB
# 📦 Downloading embedding model...
# Downloading: 100% |███████████████| 90MB/90MB
# ✅ Models cached!
# 🚀 Starting server...
```

**Time**: 15-40 minutes (depends on internet speed)

### Subsequent Runs (Cache Exists)
```bash
cd backend-ai
source venv/bin/activate
python -m app.main

# Output:
# 🤖 Loading LLM from cache...
# ✅ LLM loaded successfully from cache!
# 📦 Loading embedding model from cache...
# ✅ Embedding model loaded: all-MiniLM-L6-v2
# 🚀 Starting server...
```

**Time**: 5-10 seconds (instant!)

---

## 🔍 Verify Cache Status

### Check Both Caches
```bash
# GPT4All cache
echo "GPT4All Cache:"
ls -lh ~/.cache/gpt4all/ 2>/dev/null || echo "Not cached yet"

# Embeddings cache
echo -e "\nEmbeddings Cache:"
ls -lh ~/.cache/torch/sentence_transformers/ 2>/dev/null || echo "Not cached yet"

# Total cache size
echo -e "\nTotal Cache Size:"
du -sh ~/.cache/gpt4all/ ~/.cache/torch/sentence_transformers/ 2>/dev/null
```

### Expected Output (Cached)
```
GPT4All Cache:
-rw-r--r-- 1 user staff 4.1G Oct  8 2025 mistral-7b-instruct-v0.2.Q4_0.gguf

Embeddings Cache:
drwxr-xr-x 8 user staff 256B Oct  8 2025 sentence-transformers_all-MiniLM-L6-v2

Total Cache Size:
4.1G    /Users/user/.cache/gpt4all/
90M     /Users/user/.cache/torch/sentence_transformers/
```

---

## 🗑️ Clear Cache (If Needed)

### Clear LLM Cache
```bash
rm -rf ~/.cache/gpt4all/
# Next run will re-download (~4GB, 15-30 min)
```

### Clear Embeddings Cache
```bash
rm -rf ~/.cache/torch/sentence_transformers/
# Next run will re-download (~90MB, 1-2 min)
```

### Clear Both
```bash
rm -rf ~/.cache/gpt4all/ ~/.cache/torch/sentence_transformers/
echo "✅ All model caches cleared"
# Next run will re-download everything
```

---

## 💡 Cache Benefits

| Aspect | First Run | Cached Run |
|--------|-----------|------------|
| LLM load time | 15-30 min | 3-5 sec |
| Embedding load | 1-2 min | <1 sec |
| Download size | ~4.2GB | 0 bytes |
| Internet needed | Yes | No |
| Server startup | 20-35 min | 5-10 sec |

---

## 🔧 Troubleshooting

### Issue: "Model not found" Error
**Cause**: Cache directory doesn't exist or is empty

**Solution**:
```bash
# Check cache
ls ~/.cache/gpt4all/

# If empty, models will download on next run
python -m app.main
```

### Issue: "Permission Denied" on Cache
**Cause**: Cache directory has wrong permissions

**Solution**:
```bash
# Fix permissions
chmod -R u+rw ~/.cache/gpt4all/
chmod -R u+rw ~/.cache/torch/
```

### Issue: "Corrupted Model" Error
**Cause**: Incomplete or corrupted download

**Solution**:
```bash
# Delete corrupted cache
rm -rf ~/.cache/gpt4all/mistral-7b-instruct-v0.2.Q4_0.gguf

# Re-download
python -m app.main
```

### Issue: Running Out of Disk Space
**Current usage**:
```bash
# Check cache size
du -sh ~/.cache/gpt4all/ ~/.cache/torch/
# Total: ~4.2GB

# Check available space
df -h ~
```

**Solution**: Need at least 10GB free for safe operation

---

## 📊 Cache Statistics

### Download Times (Approximate)

| Connection Speed | LLM Download | Embeddings | Total |
|-----------------|--------------|------------|-------|
| 10 Mbps | 60-90 min | 2-3 min | ~65-95 min |
| 50 Mbps | 12-15 min | 30-60 sec | ~13-16 min |
| 100 Mbps | 6-8 min | 15-30 sec | ~7-9 min |
| 500 Mbps | 1-2 min | 5-10 sec | ~2-3 min |

### Storage Requirements

| Component | Size | Location |
|-----------|------|----------|
| LLM (Mistral-7B Q4) | 4.1 GB | ~/.cache/gpt4all/ |
| Embeddings (MiniLM) | 90 MB | ~/.cache/torch/ |
| **Total Cache** | **~4.2 GB** | **~/.cache/** |

---

## 🎯 Best Practices

### 1. Pre-download Models
```bash
# Download models before first use
cd backend-ai
source venv/bin/activate

# This will trigger downloads
python -c "from gpt4all import GPT4All; GPT4All('mistral-7b-instruct-v0.2.Q4_0.gguf')"
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

### 2. Verify Cache Before Running
```bash
# Quick check script
cat > check_cache.sh << 'EOF'
#!/bin/bash
echo "Checking model cache..."

if [ -f ~/.cache/gpt4all/mistral-7b-instruct-v0.2.Q4_0.gguf ]; then
    echo "✅ LLM cached ($(du -sh ~/.cache/gpt4all/*.gguf | cut -f1))"
else
    echo "❌ LLM not cached (will download ~4GB)"
fi

if [ -d ~/.cache/torch/sentence_transformers/sentence-transformers_all-MiniLM-L6-v2 ]; then
    echo "✅ Embeddings cached"
else
    echo "❌ Embeddings not cached (will download ~90MB)"
fi
EOF

chmod +x check_cache.sh
./check_cache.sh
```

### 3. Backup Cache (Optional)
```bash
# Backup to external drive
tar -czf models_cache_backup.tar.gz \
  ~/.cache/gpt4all/ \
  ~/.cache/torch/sentence_transformers/

# Restore on new machine
tar -xzf models_cache_backup.tar.gz -C ~/
```

---

## 🚀 Quick Cache Commands

```bash
# Check cache status
ls -lh ~/.cache/gpt4all/ ~/.cache/torch/sentence_transformers/

# Check cache size
du -sh ~/.cache/gpt4all/ ~/.cache/torch/

# Clear all caches
rm -rf ~/.cache/gpt4all/ ~/.cache/torch/sentence_transformers/

# Verify models work
python -c "from gpt4all import GPT4All; print('LLM OK')"
python -c "from sentence_transformers import SentenceTransformer; print('Embeddings OK')"
```

---

## 📝 Summary

- ✅ **All models cached automatically**
- ✅ **First run**: Downloads to cache (~15-30 min)
- ✅ **Subsequent runs**: Loads from cache (~5 sec)
- ✅ **No internet needed** after first download
- ✅ **Total cache size**: ~4.2GB
- ✅ **Cache locations**: `~/.cache/gpt4all/` and `~/.cache/torch/`

**Your models will persist across runs and only need to be downloaded once!** 🎉

---

**Last Updated**: October 2025
