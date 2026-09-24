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
    ArtworkCard(
        artwork: Artwork(
            id: 160729,
            title: "Baoyang Lake",
            creationDate: "1500s",
            creators: [Creator(description: "Song Xu (Chinese, 1525-c. 1606)")],
            images: ArtworkImages(web: ImageAsset(url: "https://openaccess-cdn.clevelandart.org/1998.78.14/1998.78.14_web.jpg"))
        )
    )
    .frame(width: 180)
    .padding()
}

#Preview("No image") {
    ArtworkCard(
        artwork: Artwork(id: 1, title: nil, creationDate: nil, creators: nil, images: nil)
    )
    .frame(width: 180)
    .padding()
}
