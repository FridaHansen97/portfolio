import SwiftUI
import SwiftData

@main
struct ArtAppApp: App {
    @State private var artworkRepository: any ArtworkRepositoryProtocol = ArtworkRepository()
    
    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(\.artworkRepository, artworkRepository)
        }
        .modelContainer(for: FavoriteArtwork.self)
    }
}
