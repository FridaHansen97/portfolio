import SwiftUI

struct RootView: View {
    var body: some View {
        NavigationStack {
            ArtworkListView()
        }
    }
}

#Preview {
    RootView()
        .environment(\.artworkRepository, ArtworkRepository())
}
