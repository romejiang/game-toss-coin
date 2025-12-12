import wave
import math
import struct

def generate_coin_sound(filename, duration=0.15, volume=0.5):
    sample_rate = 44100
    n_samples = int(sample_rate * duration)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes per sample (16-bit)
        wav_file.setframerate(sample_rate)
        
        for i in range(n_samples):
            t = i / sample_rate
            # 两个频率混合：主频 1200Hz 快速升到 2000Hz (模拟 Ting!)
            # 添加一个泛音
            freq_mod = 1200 + (t / duration) * 800
            
            # 使用简单的正弦波
            value = math.sin(2 * math.pi * freq_mod * t)
            
            # 淡出效果
            decay = 1.0 - (t / duration)
            
            # 缩放到 16-bit 整数范围
            sample_value = int(value * volume * decay * 32767)
            
            # 写入
            wav_file.writeframes(struct.pack('h', sample_value))

if __name__ == "__main__":
    generate_coin_sound("assets/coin.wav")
