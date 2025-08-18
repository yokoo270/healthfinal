@@ .. @@
export function ExportModal({ children }: ExportModalProps) {
-  const { user, canUseFeature } = useAuth()
+  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
   const [isExporting, setIsExporting] = useState(false)
@@ .. @@
     chatHistory: false,
   })

-  const canExport = canUseFeature("exportData")
+  const canExport = user?.subscription?.plan !== "free" // Only paid plans can export

  const handleExport = async () => {