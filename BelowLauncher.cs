using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

internal static class BelowLauncher
{
    [STAThread]
    private static void Main()
    {
        string folder = AppDomain.CurrentDomain.BaseDirectory;
        string page = Path.Combine(folder, "index.html");
        if (!File.Exists(page))
        {
            MessageBox.Show("Não encontrei index.html na pasta do jogo. Extraia o jogo completo e mantenha o arquivo junto com a pasta assets.", "Below", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        string uri = new Uri(page).AbsoluteUri;
        string[] browsers = new string[] {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Microsoft", "Edge", "Application", "msedge.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Microsoft", "Edge", "Application", "msedge.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Google", "Chrome", "Application", "chrome.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Google", "Chrome", "Application", "chrome.exe")
        };

        foreach (string browser in browsers)
        {
            if (File.Exists(browser))
            {
                Process.Start(new ProcessStartInfo(browser, "--app=\"" + uri + "\" --start-maximized") { UseShellExecute = false });
                return;
            }
        }

        try { Process.Start(new ProcessStartInfo(uri) { UseShellExecute = true }); }
        catch (Exception ex) { MessageBox.Show("Não foi possível abrir o jogo no navegador. " + ex.Message, "Below", MessageBoxButtons.OK, MessageBoxIcon.Error); }
    }
}
