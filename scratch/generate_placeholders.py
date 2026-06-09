from PIL import Image

def create_placeholder(path, size, color):
    img = Image.new('RGB', size, color=color)
    img.save(path)

create_placeholder('/Users/Kuttimma/Desktop/Daksh/pw-main/src/assets/icon.png', (1024, 1024), 'orange')
create_placeholder('/Users/Kuttimma/Desktop/Daksh/pw-main/src/assets/splash-screen.png', (1284, 2778), 'white')
create_placeholder('/Users/Kuttimma/Desktop/Daksh/pw-main/src/assets/adaptive-icon.png', (1024, 1024), 'orange')
create_placeholder('/Users/Kuttimma/Desktop/Daksh/pw-main/src/assets/favicon.png', (48, 48), 'orange')
