import SwiftUI
import SwiftData

struct RootView: View {
    var body: some View {
        TabView {
            Tab("Artworks", systemImage: "photo.on.rectangle") {
                NavigationStack {
                    ArtworkListView()
                }
            }
            Tab("Favorites", systemImage: "heart") {
                NavigationStack {
                    FavoritesView()
                }
            }
        }
    }
}

#Preview {
    RootView()
        .environment(\.artworkRepository, ArtworkRepository())
        .modelContainer(for: FavoriteArtwork.self, inMemory: true)
}
