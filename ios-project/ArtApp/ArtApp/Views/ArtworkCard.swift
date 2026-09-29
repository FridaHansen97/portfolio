import SwiftUI

struct ArtworkCard: View {
    let artwork: Artwork
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Color(.secondarySystemBackground)
                .aspectRatio(1, contentMode: .fit)
                .overlay {
                    ArtworkImage(url: artwork.imageURL)
                }
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .shadow(color: .black.opacity(0.12), radius: 6, y:3)
                .accessibilityLabel(artwork.title ?? "Artwork")
            
            VStack(alignment: .leading, spacing: 2) {
                Text(artwork.title ?? "Untitled")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .lineLimit(2, reservesSpace: true)
                
                Text(artwork.artistName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
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
