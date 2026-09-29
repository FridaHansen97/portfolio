import SwiftUI

struct ArtworkImage: View {
    let url: URL?
    var contentMode: ContentMode = .fit
    
    @State private var image: UIImage?
    @State private var failed = false
    
    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: contentMode)
            } else if failed {
                Image(systemName: "photo")
                    .foregroundStyle(.secondary)
            } else {
                ProgressView()
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .task(id: url) {
            await loadImage()
        }
    }
    
    private func loadImage() async {
        guard let url else {
            failed = true
            return
        }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let uiImage = UIImage(data: data) {
                image = uiImage
            } else {
                failed = true
            }
            
        } catch {
            if !Task.isCancelled {
                print("Image failed: \(error)")
                failed = true
            }
        }
    }
}

#Preview {
    ArtworkImage(url: Artwork.sample.imageURL)
        .frame(width: 200, height: 200)
}
