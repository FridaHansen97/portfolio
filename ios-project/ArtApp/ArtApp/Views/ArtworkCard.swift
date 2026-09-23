import SwiftUI

struct ArtworkCard: View {
    let artwork: Artwork
    let imageURL: URL?
    
    var body: some View {
        VStack (alignment: .leading, spacing: 6){
            Color.clear
                .aspectRatio(1, contentMode: .fit)
                .overlay {
                    AsyncImage(url: imageURL) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFit()
                        case .failure:
                            Image(systemName: "photo")
                        default:
                            ProgressView()
                        }
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .accessibilityLabel(artwork.thumbnail?.altText ?? artwork.title ?? "Artwork")
            Text(artwork.title ?? "Untitled")
                .font(.caption)
                .fontWeight(.semibold)
                .lineLimit(2)
            Text(artwork.artistName)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
    }
}
