import SwiftUI
import SwiftData

struct FavoriteButton: View {
    let artwork: Artwork
    
    @Environment(\.modelContext) private var modelContext
    @Query private var matches: [FavoriteArtwork]
    
    init(artwork: Artwork) {
        self.artwork = artwork
        let id = artwork.id
        _matches = Query(filter: #Predicate<FavoriteArtwork> { $0.artworkId == id })
    }
    
    private var isFavorite: Bool {
        !matches.isEmpty
    }
    
    var body: some View {
        Button {
            toggleFavorite()
        } label: {
            Image(systemName: isFavorite ? "heart.fill" : "heart")
                .foregroundStyle(isFavorite ? .red : .primary)
                .padding(8)
                .background(.ultraThinMaterial, in: Circle())
        }
        .accessibilityLabel(isFavorite ? "Remove from favorites" : "Add to favorites")
    }
    
    private func toggleFavorite() {
        if let existing = matches.first {
            modelContext.delete(existing)
        } else {
            modelContext.insert(FavoriteArtwork(artwork: artwork))
        }
    }
}
