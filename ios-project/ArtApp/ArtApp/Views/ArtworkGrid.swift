import SwiftUI
import SwiftData

struct ArtworkGrid: View {
    let artworks: [Artwork]
    
    private let columns = [GridItem(.adaptive(minimum: 150), spacing: 12)]
    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
                ForEach(artworks) { artwork in
                    NavigationLink(value: artwork) {
                        ArtworkCard(artwork: artwork)
                    }
                    .buttonStyle(.plain)
                    .overlay(alignment: .topTrailing) {
                        FavoriteButton(artwork: artwork)
                            .padding(6)
                    }
                }
            }
            .padding()
        }
    }
}

#Preview {
    NavigationStack {
        ArtworkGrid(artworks: [.sample, .empty])
    }
    .modelContainer(for: FavoriteArtwork.self, inMemory: true)
}
