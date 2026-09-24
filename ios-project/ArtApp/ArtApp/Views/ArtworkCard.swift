import SwiftUI

struct ArtworkCard: View {
    let artwork: Artwork

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Color.clear
                .aspectRatio(1, contentMode: .fit)
                .overlay {
                    AsyncImage(url: artwork.imageURL) { phase in
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
                .accessibilityLabel(artwork.title ?? "Artwork")

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

#Preview("With image") {
    ArtworkCard(artwork: .sample)
        .frame(width: 180)
        .padding()
}

#Preview("No image") {
    ArtworkCard(artwork: .empty)
        .frame(width: 180)
        .padding()
}
