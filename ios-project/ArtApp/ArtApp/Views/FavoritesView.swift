import SwiftUI
import SwiftData

struct FavoritesView: View {
    @Query(sort: \FavoriteArtwork.dateAdded, order: .reverse)
    private var favorites: [FavoriteArtwork]
    
    private let columns = [GridItem(.adaptive(minimum: 150), spacing: 12)]
    
    var body: some View {
        Group {
            if favorites.isEmpty {
                ContentUnavailableView( "No Favorites Yet", systemImage: "heart", description: Text("Tap the heart on an artwork to save it here.")
                )
            } else {
                ScrollView {
                    LazyVGrid(columns: columns, spacing: 16) {
                        ForEach(favorites) { favorite in
                            let artwork = favorite.artwork
                            
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

#Preview("empty") {
    NavigationStack {
        FavoritesView()
    }
    .modelContainer(for: FavoriteArtwork.self, inMemory: true)
}
