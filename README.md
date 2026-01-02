# ComfyUI-HY-Motion1

A ComfyUI plugin based on [HY-Motion 1.0](https://github.com/Tencent-Hunyuan/HY-Motion-1.0) for text-to-3D human motion generation.

## Features

- **Text-to-Motion Generation**: Generate 3D human motion from text descriptions
- **Multi-sample Generation**: Generate multiple motion samples simultaneously
- **Motion Preview**: Real-time skeleton preview rendering
- **FBX Export**: Export to standard FBX format for Maya/Blender and other DCC tools
- **NPZ Save**: Save in universal NPZ format
- **GGUF Support**: Load quantized Qwen3-8B GGUF models for lower VRAM usage

## Installation

### 1. Install Dependencies

```bash
cd ComfyUI/custom_nodes/ComfyUI-HY-Motion1
pip install -r requirements.txt
```

### 2. Download Model Weights

Place model weights in ComfyUI's models directory:

```
ComfyUI/
└── models/
    └── HY-Motion/
        └── ckpts/
            ├── tencent/
            │   ├── HY-Motion-1.0/
            │   │   ├── config.yml
            │   │   └── latest.ckpt
            │   └── HY-Motion-1.0-Lite/
            │       ├── config.yml
            │       └── latest.ckpt
            └── GGUF/                    # Optional: for GGUF models
                └── Qwen3-8B-Q4_K_M.gguf
```

Download using huggingface-cli:

```bash
# Create directory first
mkdir -p models/HY-Motion/ckpts/tencent

# Download models
huggingface-cli download tencent/HY-Motion-1.0 --local-dir models/HY-Motion/ckpts/tencent
```

or manually download from https://huggingface.co/tencent/HY-Motion-1.0/tree/main

## Node Documentation

### HY-Motion Load LLM
Load Qwen3-8B LLM from HuggingFace (supports BitsAndBytes quantization).

| Parameter | Description |
|-----------|-------------|
| quantization | Quantization mode: `none` / `int8` / `int4` |

### HY-Motion Load LLM (GGUF)
Load Qwen3-8B LLM from GGUF file.

| Parameter | Description |
|-----------|-------------|
| gguf_file | Select GGUF file from the list |

**Note**: You need to download GGUF files manually from https://huggingface.co/Qwen/Qwen3-8B-GGUF

Place GGUF files in: `ComfyUI/models/HY-Motion/ckpts/GGUF/`

Recommended GGUF versions:
| File | Size | Description |
|------|------|-------------|
| Qwen3-8B-Q4_K_M.gguf | 5.03 GB | Best balance of quality and size (recommended) |
| Qwen3-8B-Q5_K_M.gguf | 5.85 GB | Higher quality |
| Qwen3-8B-Q6_K.gguf | 6.73 GB | Near original quality |
| Qwen3-8B-Q8_0.gguf | ~8 GB | Almost lossless |

### HY-Motion Load Network
Load Motion Diffusion Network.

| Parameter | Description |
|-----------|-------------|
| model_name | Select model version: `HY-Motion-1.0` or `HY-Motion-1.0-Lite` |

### HY-Motion Encode Text
Encode text prompt for motion generation.

| Parameter | Description |
|-----------|-------------|
| llm | LLM model from Load LLM node |
| text | Motion description text |

### HY-Motion Generate
Core generation node.

| Parameter | Description |
|-----------|-------------|
| network | Network from Load Network node |
| conditioning | Conditioning from Encode Text node |
| duration | Motion duration (seconds) |
| seed | Random seed |
| cfg_scale | Text guidance scale |
| num_samples | Number of samples to generate |

### HY-Motion Preview
Render skeleton preview images.

### HY-Motion Export FBX
Export FBX file (requires fbxsdkpy installation).

### HY-Motion Save NPZ
Save in NPZ format.

## Example Workflow

```
[HY-Motion Load LLM] ──┐
                       ├──> [HY-Motion Encode Text] ──┐
[HY-Motion Load Network] ─────────────────────────────┴──> [HY-Motion Generate] ──> [HY-Motion Preview]
                                                                                 └──> [HY-Motion Save NPZ]
                                                                                 └──> [HY-Motion Export FBX]
```

For GGUF:
```
[HY-Motion Load LLM (GGUF)] ──> [HY-Motion Encode Text] ──> ...
```

## Notes

1. **VRAM Requirements**:
   - HY-Motion-1.0: ~8GB+ VRAM (model only)
   - HY-Motion-1.0-Lite: ~4GB+ VRAM (model only)
   - Qwen3-8B Text Encoder (additional):
     - HuggingFace `quantization=none`: ~16GB VRAM
     - HuggingFace `quantization=int8`: ~8GB VRAM
     - HuggingFace `quantization=int4`: ~4GB VRAM
     - GGUF Q4_K_M: ~5GB VRAM

2. **GGUF Requirements**:
   - Requires `transformers>=4.40`
   - GGUF files must be downloaded manually
   - Place in `ComfyUI/models/HY-Motion/ckpts/GGUF/`

3. **FBX Export**: Requires additional fbxsdkpy installation:
   ```bash
   pip install fbxsdkpy --extra-index-url https://gitlab.inria.fr/api/v4/projects/18692/packages/pypi/simple
   ```

4. **Text Encoder**: CLIP model will be downloaded automatically on first use. Qwen3-8B will be downloaded automatically when using Load LLM node (not GGUF).

## License

Please refer to the HY-Motion 1.0 original project license.
