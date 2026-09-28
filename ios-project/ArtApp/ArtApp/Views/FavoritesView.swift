import SwiftUI
import SwiftData

struct FavoritesView: View {
    @Query(sort: \FavoriteArtwork.dateAdded, order: .reverse)
    private var favorites: [FavoriteArtwork]
    
    var body: some View {
        Group {
            if favorites.isEmpty {
                ContentUnavailableView( "No Favorites Yet", systemImage: "heart", description: Text("Tap the heart on an artwork to save it here.")
                )
            } else {
                ArtworkGrid(artworks: favorites.map(\.artwork))
            }
        }
        .navigationTitle("Favorites")
        .navigationDestination(for: Artwork.self) { artwork in
            ArtworkDetailView(artwork: artwork)
        }
    }
}

#Preview("With favorites") {
    let container = try! ModelContainer(
        for: FavoriteArtwork.self, configurations: ModelConfiguration(isStoredInMemoryOnly: true)
    )
    container.mainContext.insert(FavoriteArtwork(artwork: .sample))
    return NavigationStack {
        FavoritesView()
    }
    .modelContainer(container)
}

#Preview("Empty") {
    NavigationStack {
        FavoritesView()
    }
    .modelContainer(for: FavoriteArtwork.self, inMemory: true)
}
